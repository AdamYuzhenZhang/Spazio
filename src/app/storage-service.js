// handles firestore
module.exports = {
    initUser: async (db, email, name, bio, pronouns, roomID) =>{
        const ref = db.collection('user').doc(email)
        await ref.set({
            email:email,
            name:name,
            bio:bio,
            pronouns:pronouns,
            roomID:roomID,
        })
    },

    getUserByEmail: async (db, email) => {
        const doc = await db.collection("user").doc(email).get();
        return doc.data();
    },

    initRoom: async (db, roomID, roomName, usersInRoom, roomLayout) => {
        const ref = db.collection('room').doc(roomID)
        await ref.set({
            roomID:roomID,
            roomName:roomName,
            usersInRoom:usersInRoom,
            roomLayout:roomLayout
        })
    },

    getRoomByID: async (db, roomID) => {
        const doc = await db.collection("room").doc(roomID).get();
        return doc.data();
    }
}