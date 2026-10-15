# Календарь звонков

A call-booking service: the Owner sets up Event Types, and Guests book a call of one of those types at a free time.

## Language

### People

**Owner**:
The single person whose time is booked. There is exactly one, and they have no account.
_Avoid_: Host, admin, user, calendar owner

**Guest**:
An anonymous person who books a call with the Owner by giving their name and email.
_Avoid_: Client, visitor, attendee, invitee, user

**Admin area**:
The part of the app where the Owner manages Event Types and sees upcoming Bookings. "Admin" names this area, never the Owner.
_Avoid_: Dashboard, owner page

### Booking

**Event Type**:
A kind of call the Owner offers, with an id, a name, a description and a duration that is a multiple of 15 minutes.
_Avoid_: Event, meeting type, service, call type

**Working Hours**:
The fixed daily time, 09:00 to 18:00, when the Owner takes calls.
_Avoid_: Availability, open hours, schedule, business hours

**Booking Window**:
The 14 days, starting today, in which a Guest can book.
_Avoid_: Booking horizon, range, period

**Slot**:
A start time for one Event Type: on the quarter hour, inside Working Hours and the Booking Window, and with the whole call clear of every Booking.
_Avoid_: Time slot, opening, free time

**Booking**:
A Guest's call of one Event Type at a Slot. No two Bookings overlap, whatever their Event Types.
_Avoid_: Appointment, meeting, reservation, event
