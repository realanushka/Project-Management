const roomInitializationConnectionHandler = (socket, data) => {
	const { connUserSocketId } = data;

	const initData = { connUserSocketId };
	socket.to(connUserSocketId).emit("conn-init", initData);
};

module.exports = roomInitializationConnectionHandler;