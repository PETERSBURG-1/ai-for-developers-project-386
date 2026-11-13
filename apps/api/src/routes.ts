import {
  zAvailabilityResponse,
  zBooking,
  zCreateBookingBody,
  zCreateMeetingTypeBody,
  zDeleteMeetingTypePath,
  zDeleteMeetingTypeResponse,
  zErrorResponse,
  zGetAvailabilityPath,
  zGetMeetingTypePath,
  zListBookingsResponse,
  zListMeetingTypesResponse,
  zMeetingType,
  zUpdateMeetingTypeBody,
  zUpdateMeetingTypePath,
} from "@calendar/api-client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import type { Store } from "./store";

const listBookingsQuery = z.object({
  upcoming: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export function registerRoutes(app: FastifyInstance, store: Store): void {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.get(
    "/api/meeting-types",
    {
      schema: {
        response: {
          200: zListMeetingTypesResponse,
        },
      },
    },
    async () => store.listMeetingTypes(),
  );

  typed.post(
    "/api/meeting-types",
    {
      schema: {
        body: zCreateMeetingTypeBody,
        response: {
          201: zMeetingType,
          400: zErrorResponse,
          409: zErrorResponse,
        },
      },
    },
    async (request, reply) => reply.code(201).send(store.createMeetingType(request.body)),
  );

  typed.get(
    "/api/meeting-types/:meetingTypeId",
    {
      schema: {
        params: zGetMeetingTypePath,
        response: {
          200: zMeetingType,
          404: zErrorResponse,
        },
      },
    },
    async (request) => store.getMeetingType(request.params.meetingTypeId),
  );

  typed.put(
    "/api/meeting-types/:meetingTypeId",
    {
      schema: {
        params: zUpdateMeetingTypePath,
        body: zUpdateMeetingTypeBody,
        response: {
          200: zMeetingType,
          400: zErrorResponse,
          404: zErrorResponse,
        },
      },
    },
    async (request) => store.updateMeetingType(request.params.meetingTypeId, request.body),
  );

  typed.delete(
    "/api/meeting-types/:meetingTypeId",
    {
      schema: {
        params: zDeleteMeetingTypePath,
        response: {
          204: zDeleteMeetingTypeResponse,
          404: zErrorResponse,
          409: zErrorResponse,
        },
      },
    },
    async (request, reply) => {
      store.deleteMeetingType(request.params.meetingTypeId);
      return reply.code(204).send();
    },
  );

  typed.get(
    "/api/meeting-types/:meetingTypeId/availability",
    {
      schema: {
        params: zGetAvailabilityPath,
        response: {
          200: zAvailabilityResponse,
          404: zErrorResponse,
        },
      },
    },
    async (request) => store.getAvailability(request.params.meetingTypeId),
  );

  typed.post(
    "/api/bookings",
    {
      schema: {
        body: zCreateBookingBody,
        response: {
          201: zBooking,
          400: zErrorResponse,
          404: zErrorResponse,
          409: zErrorResponse,
        },
      },
    },
    async (request, reply) => reply.code(201).send(await store.createBooking(request.body)),
  );

  typed.get(
    "/api/bookings",
    {
      schema: {
        querystring: listBookingsQuery,
        response: {
          200: zListBookingsResponse,
        },
      },
    },
    async (request) => store.listBookings(request.query.upcoming),
  );
}
