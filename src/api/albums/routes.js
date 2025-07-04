const path = require('path');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: handler.postAlbumHandler,
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: handler.getAlbumsByIdHandler,
    },

    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: handler.putAlbumByIdHandler,
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: handler.deleteAlbumByIdHandler,
    },
    {
        method: 'POST',
        path: '/albums/{id}/covers',
        handler: handler.postUploadAlbumCoverHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                maxBytes: 512000,
            },
        },
    },
    {
        method: 'GET',
        path: '/album/cover/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'images'),
            },
        },
    },
    {
        method: 'POST',
        path: '/albums/{id}/likes',
        handler: handler.postLikeAlbumHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/albums/{id}/likes',
        handler: handler.deleteLikeAlbumHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/albums/{id}/likes',
        handler: handler.getLikesAlbumHandler,
    },
];

module.exports = routes;