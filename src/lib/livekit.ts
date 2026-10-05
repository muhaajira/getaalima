import { Room, RoomEvent } from 'livekit-client'

// This is a singleton to manage the LiveKit room connection.
let room: Room | null = null

export const getRoom = (): Room => {
    if (!room) {
        room = new Room({
            adaptiveStream: true,
            dynacast: true,
            audioCaptureDefaults: { echoCancellation: true },
        })
        
        // Event listeners for UI updates
        room.on(RoomEvent.ParticipantConnected, (participant) => {
            console.log(`Participant connected: ${participant.identity}`)
        })
        room.on(RoomEvent.ParticipantDisconnected, (participant) => {
            console.log(`Participant disconnected: ${participant.identity}`)
        })
        room.on(RoomEvent.LocalTrackPublished, () => {
            console.log('Local track published')
        })
    }
    return room
}

export const disconnectFromRoom = async () => {
    if (room) {
        await room.disconnect()
        room = null
    }
}
