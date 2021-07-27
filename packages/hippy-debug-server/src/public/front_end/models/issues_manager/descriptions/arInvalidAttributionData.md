# Ensure the "trigger-data" query parameter for an attribution redirect is a valid number

The data associated with an attribution was defaulted to `0`.
This happens if the `trigger-data` query parameter provided in the `.well-known` redirect
is not a valid integer.

Note that even if a valid integer is provided, only the lowest 3-bits of the `data` query parameter
are recorded, with a 5% chance of the 3-bits being noised.
