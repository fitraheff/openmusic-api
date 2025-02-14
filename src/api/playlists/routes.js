const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: handler.postPlaylistHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: handler.getPlaylistsHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{playlistId}',
        handler: handler.deletePlaylistsByIdHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    },
        
    {
        method: 'POST',
        path: '/playlists/{playlistId}/songs',
        handler: handler.postSongsPlaylistHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{playlistId}/songs',
        handler: handler.getSongsPlaylistHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{playlistId}/songs',
        handler: handler.deleteSongsPlaylistHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{playlistId}/activities',
        handler: handler.getActivitiesPlaylistHandler,
        options: {
            auth: 'notesapp_jwt',
        },
    }
];

module.exports = routes;