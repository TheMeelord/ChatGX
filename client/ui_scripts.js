// Пример данных друзей
let friends = [
    { id: 1, username: "Пользователь1", unread_messages: 0, status: "Онлайн" },
    { id: 2, username: "Пользователь2", unread_messages: 0, status: "Офлайн" },
    // Добавьте дополнительных друзей при необходимости
  ];

  // Функция для добавления друга в список чата
function addFriendToChatList(chat_id, friend_id, friend_username, unread_messages, status) {
    const friendList = document.getElementById("friendList");
    const friendDiv = document.createElement("a");
    friendDiv.href = "#";
    friendDiv.classList.add("list-group-item", "list-group-item-action");
    friendDiv.dataset.chatId = chat_id; // Добавляем атрибут data для chat_id
    friendDiv.dataset.friendId = friend_id; // Добавляем атрибут data для friend_id
    friendDiv.innerHTML = `
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${friend_username}</h5>
        <small>${status}</small>
      </div>
      <small>Непрочитанных сообщений: <span class="unread-messages">${unread_messages}</span></small>
    `;
    friendDiv.addEventListener("click", () => loadChat(chat_id)); // Загрузка чата при клике на друга
    friendList.appendChild(friendDiv);
}

  
function updateFriendStatus(friend_id, new_status) {
    console.log(`Статус друга ${friend_id} обновлен на ${new_status}`);
    const friendDiv = document.querySelector(`a[data-friend-id="${friend_id}"]`);
    if (friendDiv) {
        friendDiv.querySelector("small").innerText = new_status;
    }
}


  // Функция загрузки чата (пока заглушка)
  /*function loadChat(chat_id) {
    alert("Загрузка чата с ID: " + chat_id);
  }*/


  