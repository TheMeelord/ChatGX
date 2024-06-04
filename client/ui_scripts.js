let currentChatId = null;

function addFriendToChatList(chat_id, friend_id, friend_username, unread_messages, status) {
  const friendList = document.getElementById("friendList");
  const friendDiv = document.createElement("a");
  friendDiv.href = "#";
  friendDiv.classList.add("list-group-item", "list-group-item-action", "friend");
  friendDiv.dataset.chatId = chat_id; // Добавляем атрибут data для chat_id
  friendDiv.dataset.friendId = friend_id; // Добавляем атрибут data для friend_id
  friendDiv.innerHTML = `
    <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">${friend_username}</h5>
    </div>
    <small>${status}</small>
  `;
  friendDiv.addEventListener("click", () => selectFriend(friendDiv, chat_id)); // Загрузка чата при клике на друга
  friendList.appendChild(friendDiv);
}


function selectFriendById(chat_id) {
  const friendElements = document.querySelectorAll('.friend');
  friendElements.forEach(friend => {
    if (friend.dataset.chatId === chat_id) {
      selectFriend(friend, chat_id);
    }
  });
}

function selectFriend(element, chat_id) {
  // Убираем класс active у всех друзей
  const friends = document.querySelectorAll('.friend');
  friends.forEach(friend => friend.classList.remove('active'));

  // Добавляем класс active текущему другу
  element.classList.add('active');

  // Устанавливаем текущий чат ID
  currentChatId = chat_id;

  // Здесь загружаем историю сообщений с выбранным пользователем
  loadChat(chat_id);
  console.log(`Chat with user ID ${currentChatId} selected`);
}

function updateFriendStatus(friend_id, new_status) {
    console.log(`Статус друга ${friend_id} обновлен на ${new_status}`);
    const friendDiv = document.querySelector(`a[data-friend-id="${friend_id}"]`);
    if (friendDiv) {
        friendDiv.querySelector("small").innerText = new_status;
    }
}
