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

    initRoom: async (db, ownerEmail, roomName, roomType, usersInRoom, roomLayout) => {
        const ref = db.collection('room').doc(ownerEmail)
        await ref.set({
            ownerEmail:ownerEmail,
            roomName:roomName,
            roomType:roomType,
            usersInRoom:usersInRoom,
            roomLayout:roomLayout
        })
    },

    getRoomByOwner: async (db, ownerEmail) => {
        const doc = await db.collection("room").doc(ownerEmail).get();
        return doc.data();
    }
}