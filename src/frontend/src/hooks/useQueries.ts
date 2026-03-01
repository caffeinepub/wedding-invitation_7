import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RSVP, RSVPStatus, WeddingDetails } from "../backend.d";
import { useActor } from "./useActor";

const DEFAULT_WEDDING: WeddingDetails = {
  coupleNames: "James & Emily",
  weddingDate: "2026-06-15",
  venueName: "The Grand Rosewood Estate",
  venueAddress: "123 Garden Lane, Rosewood, CA 90210",
  note: "Join us for an evening of love, laughter, and happily ever after.",
};

export function useWeddingDetails() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useQuery<WeddingDetails>({
    queryKey: ["weddingDetails"],
    queryFn: async () => {
      if (!actor) return DEFAULT_WEDDING;
      try {
        const details = await actor.getWeddingDetails();
        if (!details.coupleNames) {
          // Seed with default data
          await actor.setWeddingDetails(
            DEFAULT_WEDDING.coupleNames,
            DEFAULT_WEDDING.weddingDate,
            DEFAULT_WEDDING.venueName,
            DEFAULT_WEDDING.venueAddress,
            DEFAULT_WEDDING.note ?? null,
          );
          queryClient.invalidateQueries({ queryKey: ["weddingDetails"] });
          return DEFAULT_WEDDING;
        }
        return details;
      } catch {
        return DEFAULT_WEDDING;
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEFAULT_WEDDING,
  });
}

export function useSubmitRSVP() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      status,
      message,
    }: {
      name: string;
      email: string;
      status: RSVPStatus;
      message?: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.submitRSVP(name, email, status, message ?? null);
    },
  });
}

export type { WeddingDetails, RSVP };
