import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{ title: "Calendar API" })
namespace Calendar;

model HealthResponse {
  status: "ok";
}

model MeetingType {
  @minLength(1)
  @maxLength(64)
  @pattern("^[a-z0-9]+(?:-[a-z0-9]+)*$")
  id: string;

  @minLength(1)
  @maxLength(120)
  title: string;

  @maxLength(2000)
  description: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

model CreateMeetingTypeRequest {
  @minLength(1)
  @maxLength(64)
  @pattern("^[a-z0-9]+(?:-[a-z0-9]+)*$")
  id: string;

  @minLength(1)
  @maxLength(120)
  title: string;

  @maxLength(2000)
  description: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

model UpdateMeetingTypeRequest {
  @minLength(1)
  @maxLength(120)
  title: string;

  @maxLength(2000)
  description: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

model Slot {
  start: utcDateTime;
  end: utcDateTime;
  available: boolean;
}

model AvailabilityDay {
  date: plainDate;
  freeSlotsCount: int32;
  slots: Slot[];
}

model AvailabilityResponse {
  days: AvailabilityDay[];
}

model Booking {
  id: string;
  meetingTypeId: string;
  meetingType: MeetingType;
  start: utcDateTime;
  end: utcDateTime;
  guestName: string;
  guestEmail: string;
  guestNotes?: string;
  createdAt: utcDateTime;
}

model CreateBookingRequest {
  meetingTypeId: string;

  start: utcDateTime;

  @minLength(1)
  @maxLength(100)
  guestName: string;

  @format("email")
  @maxLength(254)
  guestEmail: string;

  @maxLength(1000)
  guestNotes?: string;
}

model ApiError {
  code: string;
  message: string;
  details?: string[];
}

model ErrorResponse {
  error: ApiError;
}

@error
model BadRequest {
  @statusCode statusCode: 400;
  @body body: ErrorResponse;
}

@error
model NotFound {
  @statusCode statusCode: 404;
  @body body: ErrorResponse;
}

@error
model Conflict {
  @statusCode statusCode: 409;
  @body body: ErrorResponse;
}

model CreatedMeetingType {
  @statusCode statusCode: 201;
  @body body: MeetingType;
}

model CreatedBooking {
  @statusCode statusCode: 201;
  @body body: Booking;
}

model NoContent {
  @statusCode statusCode: 204;
}

@route("/api")
interface Health {
  @get
  @route("/health")
  @operationId("getHealth")
  health(): HealthResponse;
}

@route("/api/meeting-types")
interface MeetingTypes {
  @get
  @operationId("listMeetingTypes")
  list(): MeetingType[];

  @post
  @operationId("createMeetingType")
  create(@body body: CreateMeetingTypeRequest): CreatedMeetingType | BadRequest | Conflict;

  @get
  @route("/{meetingTypeId}")
  @operationId("getMeetingType")
  get(@path meetingTypeId: string): MeetingType | NotFound;

  @put
  @route("/{meetingTypeId}")
  @operationId("updateMeetingType")
  update(
    @path meetingTypeId: string,
    @body body: UpdateMeetingTypeRequest,
  ): MeetingType | BadRequest | NotFound;

  @delete
  @route("/{meetingTypeId}")
  @operationId("deleteMeetingType")
  delete(@path meetingTypeId: string): NoContent | NotFound | Conflict;

  @get
  @route("/{meetingTypeId}/availability")
  @operationId("getAvailability")
  availability(@path meetingTypeId: string): AvailabilityResponse | NotFound;
}

@route("/api/bookings")
interface Bookings {
  @post
  @operationId("createBooking")
  create(@body body: CreateBookingRequest): CreatedBooking | BadRequest | NotFound | Conflict;

  @get
  @operationId("listBookings")
  list(@query upcoming?: boolean): Booking[];
}
