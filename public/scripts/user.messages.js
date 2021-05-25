const messageArea = document.querySelector('.main-message-area');
const msgForm = document.querySelector('#message-form');
const msgInput = document.querySelector('#message-input');
const userFriends = document.querySelectorAll('.user-friend');
const sendBtn = document.querySelector('#send-message');
const PORT = 3000;

let currnetFriendChat = null;
let currentUser = msgForm.dataset.currentUser;

userFriends.forEach((uFriend => {
  uFriend.addEventListener('click', function () {
    currnetFriendChat = uFriend.dataset.userid;
    uFriend.classList.add('user-friend-selected');
    for (let u of userFriends) {
      if (u != this) {
        if (u.classList.contains('user-friend-selected')) {
          u.classList.remove('user-friend-selected');
        }
      }
    }
  })
}))

// (() => {
//   let socket = io();
//   msgForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     socket.emit('chat-message',currentUser,currnetFriendChat, msgInput.value);
//     // console.log(msgInput.value);
//     msgInput.value = "";
//   })

//   socket.on('messages-list',(arr)=>{
//     console.log(arr);
//     for(let msg of arr.messages){
//       const elem = document.createElement('p');
//       elem.textContent = msg.message;
//       messageArea.append(elem);
//     }
//   })  

// })();

// const createFriendMessage = (friend,message) => {
//   const friendMessage = document.createElement('div');
//   friendMessage.classList.add('friend-message-container');
//   friendMessage.textContent = message;
//   messageArea.append(friendMessage);
// }

// const createUserMessage = (user,message) => {
//   const userMessage = document.createElement('div');
//   userMessage.classList.add('user-message-container');
//   userMessage.textContent = message;
//   messageArea.append(userMessage);
// }


// (()=>{
//   sendBtn.addEventListener('click',()=>{
//     sendMessage(msgInput.value);
//     msgInput.value = "";
//   })
//   getMessage();
// })();


const Url = `http://localhost:${PORT}/user/${currentUser}/messages/${currentFriendChat}`;
console.log(Url);

// const sendMessage = async(message) => {
//   await axios.post(Url,{message});
// }

// const getMessage = async () => {
//   await axios.get(Url)
//   .then(res=>{
//     console.log(res);
//   })
// }


// msgForm.addEventListener('submit',async (e)=>{
//   e.preventDefault();
//   alert(msgInput.value);
//   sendMessage(msgInput.value);
//   msgInput.value = "";
//   getMessage();
// })



