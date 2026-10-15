# Календарь звонков

A call-booking service: the Owner publishes when they are free, and Guests book a call inside that time.

## Language

### People

**Owner**:
The single person whose time is booked. There is exactly one, and they have no account.
_Avoid_: Host, admin, user, calendar owner

**Guest**:
An anonymous person who books a call with the Owner by giving their name and email.
_Avoid_: Client, visitor, attendee, invitee, user

**Admin area**:
The part of the app where the Owner manages Availability Windows and sees Bookings. "Admin" names this area, never the Owner.
_Avoid_: Dashboard, owner page

### Booking

**Availability Window**:
A specific date and time range, within one day, that the Owner publishes as free for calls.
_Avoid_: Event, availability, open hours, schedule

**Slot**:
A free start time plus a chosen duration, inside an Availability Window and clear of every Booking, that a Guest can book.
_Avoid_: Time slot, opening, free time

**Booking**:
A Guest's 15- or 30-minute call with the Owner: a Slot once it has been taken.
_Avoid_: Appointment, meeting, reservation, event
