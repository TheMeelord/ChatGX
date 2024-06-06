function updateFriendStatus(friend_id, new_status) {
  console.log(`Статус друга ${friend_id} обновлен на ${new_status}`);
  const friendDiv = document.querySelector(`a[data-friend-id="${friend_id}"]`);
  if (friendDiv) {
      friendDiv.querySelector("small").innerText = new_status;
  }
}

function exChat(){
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
    location.reload();
}

function addFriendToChatList(chat_id, friend_id, friend_username, unread_messages, status) {
  const friendList = document.getElementById("friendList");
  const friendDiv = document.createElement("a");
  friendDiv.href = "#";
  friendDiv.classList.add("list-group-item", "list-group-item-action", "friend");
  friendDiv.dataset.chatId = chat_id;
  friendDiv.dataset.friendId = friend_id;
  friendDiv.innerHTML = `
  <div class="d-flex w-100 justify-content-between">
    <h5 class="mb-1">${friend_username}</h5>
  </div>
  <small>${status}</small>
`;
  friendDiv.addEventListener("click", () => selectFriend(friendDiv, chat_id));
  friendList.appendChild(friendDiv);
}