const InvariantError = require("../../exceptions/InvariantError");
const { 
    ImageHeadersSchema, 
    AlbumsPayloadSchema 
} = require("./schema")

const AlbumsValidator = {
    validateAlbumPayload: (payload) => {
        const validationResult = AlbumsPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateImageHeaders: (headers) => {
        const validationResult = ImageHeadersSchema.validate(headers);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
}

module.exports = AlbumsValidator;