const serverStore = require("../serverStore");
const roomsUpdates = require("./updates/rooms");

const roomJoinHandler = (socket, data) => {
	const { roomId } = data;

	const participantDetails = {
		userId: socket.user.userId,
		socketId: socket.ID,
	};

	const roomDetails = serverStore.getActiveRoom(roomId);

	serverStore.joinActiveRoom(roomId, participantDetails);

	// send information to users in room that they should prepare for incoming connection
	roomDetails.participants.forEach((participant) => {
		if (participant.socketId !== participantDetails.socketId) {
			socket.to(participant.socket).emit("conn-prepare", {
				connSocketId: participantDetails.socketId,
			});
		}
	});

	roomsUpdates.updateRooms();
};

module.exports = roomJoinHandler;