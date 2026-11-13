import type { MeetingType } from "@calendar/api-client";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { meetingTypePath } from "@/routes";

interface MeetingTypeCardProps {
  meetingType: MeetingType;
}

export function MeetingTypeCard({ meetingType }: MeetingTypeCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{meetingType.title}</CardTitle>
        <CardDescription>{meetingType.durationMinutes} минут</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          {meetingType.description || "Описание появится позже."}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link to={meetingTypePath(meetingType.id)}>Выбрать время</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
