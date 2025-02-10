const InvariantError = require("../../exceptions/InvariantError");
const {
    PlaylistsPayloadSchema, 
    AddSongPayloadSchema, } = require("./schema")

const PlaylistsValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = PlaylistsPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateAddSongPayload: (payload) => {
        const validationResult = AddSongPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = PlaylistsValidator;