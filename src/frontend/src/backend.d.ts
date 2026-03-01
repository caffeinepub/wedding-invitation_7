import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WeddingDetails {
    weddingDate: string;
    venueAddress: string;
    note?: string;
    coupleNames: string;
    venueName: string;
}
export interface RSVP {
    status: RSVPStatus;
    name: string;
    email: string;
    message?: string;
}
export enum RSVPStatus {
    maybe = "maybe",
    notAttending = "notAttending",
    attending = "attending"
}
export interface backendInterface {
    getAllRSVPs(): Promise<Array<RSVP>>;
    getRSVPByEmail(email: string): Promise<RSVP>;
    getWeddingDetails(): Promise<WeddingDetails>;
    setWeddingDetails(coupleNames: string, weddingDate: string, venueName: string, venueAddress: string, note: string | null): Promise<void>;
    submitRSVP(name: string, email: string, status: RSVPStatus, message: string | null): Promise<void>;
}
