# Ensure the "data" query parameter for an attribution redirect is included

The data associated with an attribution was defaulted to `0` because no `data`
query parameter in the `.well-known` redirect was provided.

Note that the `data` query parameter must be a valid integer and only the lowest 3-bits
are recorded with a 5% chance of being noised.
