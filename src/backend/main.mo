import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  // Custom types
  type RSVPStatus = {
    #attending;
    #notAttending;
    #maybe;
  };

  type WeddingDetails = {
    coupleNames : Text;
    weddingDate : Text;
    venueName : Text;
    venueAddress : Text;
    note : ?Text;
  };

  type RSVP = {
    name : Text;
    email : Text;
    status : RSVPStatus;
    message : ?Text;
  };

  module RSVP {
    public func compare(rsvp1 : RSVP, rsvp2 : RSVP) : Order.Order {
      Text.compare(rsvp1.name, rsvp2.name);
    };
  };

  let rsvps = Map.empty<Text, RSVP>();

  var weddingDetails : ?WeddingDetails = null;

  // Set wedding details (admin only)
  public shared ({ caller }) func setWeddingDetails(
    coupleNames : Text,
    weddingDate : Text,
    venueName : Text,
    venueAddress : Text,
    note : ?Text,
  ) : async () {
    weddingDetails := ?{
      coupleNames;
      weddingDate;
      venueName;
      venueAddress;
      note;
    };
  };

  // Get wedding details
  public query ({ caller }) func getWeddingDetails() : async WeddingDetails {
    switch (weddingDetails) {
      case (null) { Runtime.trap("No wedding details set") };
      case (?details) { details };
    };
  };

  // Submit RSVP
  public shared ({ caller }) func submitRSVP(name : Text, email : Text, status : RSVPStatus, message : ?Text) : async () {
    let rsvp : RSVP = {
      name;
      email;
      status;
      message;
    };
    rsvps.add(email, rsvp);
  };

  // Get all RSVPs
  public query ({ caller }) func getAllRSVPs() : async [RSVP] {
    rsvps.values().toArray().sort();
  };

  // Get RSVP by email
  public query ({ caller }) func getRSVPByEmail(email : Text) : async RSVP {
    switch (rsvps.get(email)) {
      case (null) { Runtime.trap("No RSVP found for this email") };
      case (?rsvp) { rsvp };
    };
  };
};
