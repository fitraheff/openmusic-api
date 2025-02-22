const routes = (handler) => [
    {
        method: 'POST',
        path: '/export/playlists/{playlistId}',
        handler: handler.postExportPlaylistsHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    },
];

module.exports = routes;