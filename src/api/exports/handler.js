const autoBind = require('auto-bind');

class ExportsHandler {
    constructor(service, validator, playlistsService) {
        this._service = service;
        this._validator = validator;
        this._playlistsService = playlistsService;

        autoBind(this);
    }

    async postExportPlaylistsHandler(request, h) {
        console.log("Payload request:", request.payload);

        this._validator.validateExportPlaylistsPayload(request.payload);
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;
        
        console.log("Playlist ID:", playlistId);
        console.log("Credential ID:", credentialId);

        await this._playlistsService.getPlaylistById(playlistId);
        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

        const message = {
            playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._service.sendMessage('export:playlists', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: "Permintaan Anda sedang kami proses",
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;