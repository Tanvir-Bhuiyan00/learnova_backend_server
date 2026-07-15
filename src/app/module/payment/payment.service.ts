/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import status from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  paymentFilterableFields,
  paymentSearchableFields,
} from "./payment.constant";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const studentId = session.metadata?.studentId;
      const enrollmentIdsRaw = session.metadata?.enrollmentIds;

      if (!studentId || !enrollmentIdsRaw) {
        console.error("Missing studentId or enrollmentIds in session metadata");
        return { message: "Missing studentId or enrollmentIds in session metadata" };
      }

      const enrollmentIds = enrollmentIdsRaw.split(",");

      const payments = await prisma.payment.findMany({
        where: {
          enrollmentId: { in: enrollmentIds },
          studentId,
        },
        include: { coupon: true },
      });

      if (payments.length === 0) {
        console.error("No payments found for enrollmentIds:", enrollmentIds);
        return { message: "No payments found" };
      }

      const alreadyProcessed = payments.every(
        (p) => p.status === PaymentStatus.SUCCEEDED,
      );
      if (alreadyProcessed) {
        console.log(`Session ${session.id} already processed. Skipping.`);
        return { message: `Session ${session.id} already processed. Skipping` };
      }

      const paymentIntentId = session.payment_intent as string;
      const paymentGatewayData = session as any;

      await prisma.$transaction(async (tx) => {
        for (const payment of payments) {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              stripePaymentIntentId: paymentIntentId,
              paymentGatewayData,
              status:
                session.payment_status === "paid"
                  ? PaymentStatus.SUCCEEDED
                  : PaymentStatus.FAILED,
            },
          });

          if (
            session.payment_status === "paid" &&
            payment.coupon
          ) {
            await tx.coupon.update({
              where: { id: payment.coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      });

      console.log(
        `Processed checkout.session.completed for enrollments: ${enrollmentIdsRaw}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const studentId = session.metadata?.studentId;
      const enrollmentIdsRaw = session.metadata?.enrollmentIds;

      if (studentId && enrollmentIdsRaw) {
        const enrollmentIds = enrollmentIdsRaw.split(",");

        await prisma.$transaction(async (tx) => {
          await tx.payment.updateMany({
            where: {
              enrollmentId: { in: enrollmentIds },
              studentId,
              status: PaymentStatus.PENDING,
            },
            data: {
              status: PaymentStatus.FAILED,
            },
          });

          await tx.enrollment.updateMany({
            where: { id: { in: enrollmentIds } },
            data: { isDeleted: true, deletedAt: new Date() },
          });
        });
      }

      console.log(`Checkout session ${session.id} expired. Payments marked as failed.`);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await prisma.payment.updateMany({
        where: {
          stripePaymentIntentId: paymentIntent.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.FAILED,
        },
      });

      console.log(`Payment intent ${paymentIntent.id} failed.`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook event ${event.id} processed successfully` };
};

const getMyPayments = async (user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const payments = await prisma.payment.findMany({
    where: { studentId: student.id, isDeleted: false },
    include: {
      enrollment: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
            },
          },
        },
      },
      coupon: {
        select: {
          code: true,
          discountType: true,
          discountValue: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments;
};

const getAllPayments = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.payment, query, {
    searchableFields: paymentSearchableFields,
    filterableFields: paymentFilterableFields,
  });

  const result = await queryBuilder
    .where({ isDeleted: false } as any)
    .search()
    .filter()
    .include({
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      enrollment: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      coupon: {
        select: {
          code: true,
          discountType: true,
          discountValue: true,
        },
      },
    } as any)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

export const PaymentService = {
  handlerStripeWebhookEvent,
  getMyPayments,
  getAllPayments,
};
