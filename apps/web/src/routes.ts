export const routes = {
  home: "/",
  booking: "/book",
  bookingType: "/book/:meetingTypeId",
  admin: "/admin",
  adminNewType: "/admin/meeting-types/new",
  adminEditType: "/admin/meeting-types/:id/edit",
} as const;

export function meetingTypePath(meetingTypeId: string): string {
  return `${routes.booking}/${encodeURIComponent(meetingTypeId)}`;
}

export function editMeetingTypePath(meetingTypeId: string): string {
  return `/admin/meeting-types/${encodeURIComponent(meetingTypeId)}/edit`;
}
