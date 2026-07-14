import { Prisma } from "../../../generated/prisma/client";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateInstructorPayload } from "./instructor.interface";

const getAllInstructors = async (query: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) => {
    const { page = 1, limit = 10, searchTerm, sortBy = "createdAt", sortOrder = "desc" } = query;

    const skip = (page - 1) * limit;

    const andConditions: Prisma.InstructorWhereInput[] = [{ isDeleted: false }];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } },
                { designation: { contains: searchTerm, mode: "insensitive" } },
                { currentWorkingPlace: { contains: searchTerm, mode: "insensitive" } },
            ],
        });
    }

    const where: Prisma.InstructorWhereInput = { AND: andConditions };

    const [instructors, total] = await Promise.all([
        prisma.instructor.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                        profilePhoto: true,
                    },
                },
                _count: {
                    select: { courses: true, reviews: true },
                },
            },
        }),
        prisma.instructor.count({ where }),
    ]);

    return {
        data: instructors,
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
    };
};

const getInstructorById = async (id: string) => {
    const instructor = await prisma.instructor.findUnique({
        where: { id, isDeleted: false },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    profilePhoto: true,
                },
            },
            courses: {
                where: { isDeleted: false },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    level: true,
                    status: true,
                    thumbnail: true,
                    averageRating: true,
                    totalStudents: true,
                },
            },
            _count: {
                select: { courses: true, reviews: true },
            },
        },
    });

    if (!instructor) {
        throw new AppError(status.NOT_FOUND, "Instructor not found");
    }

    return instructor;
};

const updateInstructor = async (id: string, payload: IUpdateInstructorPayload) => {
    const instructor = await prisma.instructor.findUnique({
        where: { id, isDeleted: false },
    });

    if (!instructor) {
        throw new AppError(status.NOT_FOUND, "Instructor not found");
    }

    const result = await prisma.instructor.update({
        where: { id },
        data: payload,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    profilePhoto: true,
                },
            },
        },
    });

    return result;
};

const softDeleteInstructor = async (id: string) => {
    const instructor = await prisma.instructor.findUnique({
        where: { id, isDeleted: false },
    });

    if (!instructor) {
        throw new AppError(status.NOT_FOUND, "Instructor not found");
    }

    const result = await prisma.$transaction(async (tx) => {
        const deletedInstructor = await tx.instructor.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        await tx.user.update({
            where: { id: instructor.userId },
            data: {
                isDeleted: true,
                status: "DELETED",
            },
        });

        return deletedInstructor;
    });

    return result;
};

export const InstructorService = {
    getAllInstructors,
    getInstructorById,
    updateInstructor,
    softDeleteInstructor,
};
