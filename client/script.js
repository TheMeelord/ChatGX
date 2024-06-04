function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Проверяем, начинается ли текущий cookie с имени, за которым следует "="
      if (cookie.startsWith(name + '=')) {
          return cookie.substring(name.length + 1);
      }
  }
  return null;
}

var CHAT_ID = null;

const baseUrl = "ws://127.0.0.1:5000/ws/connect/";

let socket;

function initWebSocket(token) {
  const socketUrl = `${baseUrl}${token}`;
  socket = new WebSocket(socketUrl);


  socket.onopen = function(event) {
      console.log("WebSocket соединение установлено.");
  };

  socket.onmessage = function(event) {
      console.log("Получено сообщение:", event.data);
      if (event.data.includes("new message")) {
          const message = event.data.split(" ");
          let chat_id = parseInt(message[0]);
          console.log(chat_id);
          if (chat_id == CHAT_ID) {
              loadChat(chat_id);
          }

          return;
      }
      const message = event.data.split(" ");
      const friend_id = parseInt(message[0]);
      const status = message[1];

      if (status === "connected") {
          updateFriendStatus(friend_id, "online");
      } else if (status === "disconnected") {
          updateFriendStatus(friend_id, "offline");
      }
  };

  socket.onclose = function(event) {
      console.log("WebSocket соединение закрыто.");
  };

  socket.onerror = function(event) {
      console.error("Произошла ошибка WebSocket соединения:", event);
  };
}
// Функция для получения списка чатов с сервера
function getChats(token) {
  const apiUrl = `http://127.0.0.1:5000/chat/get_all/${token}`;

  $.ajax({
      type: "GET",
      url: apiUrl,
      success: function(response) {
          // Обработка успешного ответа от сервера
          if (response && response.chats) {
              response.chats.forEach(chat => {
                  addFriendToChatList(chat.id, chat.friend_id, chat.friend_username, 0, chat.friend_status);
              });
              // При загрузке страницы восстанавливаем состояние
            const savedChatId = getCookie('activeChatId');
            if (savedChatId) {
              console.log("Restored chat ID:", savedChatId);
              selectFriendById(savedChatId);
            }
          } else {
              console.error("Ошибка: Некорректный формат ответа сервера.");
          }
      },
      error: function(xhr, status, error) {
          // Обработка ошибок
          console.error("Ошибка при получении списка чатов:", error);
      }
  });
}


// Инициализация WebSocket при загрузке страницы
$(document).ready(function() {
  // Получаем токен из куки
  const token = getCookie('token');

  // Проверяем наличие токена и инициализируем WebSocket при его наличии
  if (token) {
      initWebSocket(token);
      getChats(token);
  } else {
      console.error("Ошибка: Токен не найден в куки.");
  }
});

$(document).ready(function() {
  // Функция для загрузки списка пользователей и добавления их в модальное окно
  function loadUsers(token) {
      const apiUrl = `http://127.0.0.1:5000/user/get_all/${token}`;

      $.ajax({
          type: "GET",
          url: apiUrl,
          success: function(response) {
              // Очищаем список пользователей
              $('#userList').empty();
              // Добавляем каждого пользователя в список
              response.users.forEach(user => {
                  $('#userList').append(`<li class="list-group-item" data-user-id="${user.id}" data-dismiss="modal">${user.username}</li>`);
              });
          },
          error: function(xhr, status, error) {
              console.error("Ошибка при получении списка пользователей:", error);
          }
      });
  }

  // Событие открытия модального окна для создания чата
  $('#openCreateChatModalBtn').click(function() {
      // Получаем токен из куки
      const token = getCookie('token');
      if (token) {
          loadUsers(token);
      } else {
          console.error("Ошибка: Токен не найден в куки.");
      }
  });

  // Событие выбора пользователя для создания чата
  $('#userList').on('click', 'li', function() {
      const userId = $(this).data('user-id');
      const token = getCookie('token');

      // Отправляем запрос на создание чата
      $.ajax({
          type: "POST",
          url: "http://127.0.0.1:5000/chat/create",
          contentType: "application/json",
          data: JSON.stringify({
              friend_id: userId,
              token: token
          }),
          success: function(response) {
              console.log("Чат успешно создан:", response);
              // Здесь можно добавить логику для обновления интерфейса с новым чатом
          },
          error: function(xhr, status, error) {
              console.error("Ошибка при создании чата:", error);
          }
      });
  });
});

function loadChat(chat_id) {
  const token = getCookie('token');
  const user_id = getCookie('user_id');
  CHAT_ID = chat_id;
  fetch(`http://127.0.0.1:5000/chat/history/${token}/${chat_id}`)
      .then(response => {
          if (!response.ok) {
              throw new Error('Chat not found');
          }
          return response.json();
      })
      .then(data => {
          console.log(data);
          // Обработка полученных данных чата
          const chatContainer = document.getElementById('chat');
          chatContainer.innerHTML = ''; // Очистить содержимое чата перед загрузкой новых данных
          data.messages.forEach(message => {
              const messageElement = document.createElement('div');
              messageElement.textContent = message.text;
              messageElement.classList.add('message-container');
              if (message.sender_id != user_id) {
                  messageElement.classList.add('sender-message');
              } else {
                  messageElement.classList.add('receiver-message')
              }
              chatContainer.appendChild(messageElement);
          });
          chatContainer.scrollTop = chatContainer.scrollHeight;
      })
      .catch(error => {
          alert("Ошибка: " + error.message);
      });
      document.cookie = `activeChatId=${chat_id}; path=/`;
}

function sendMessage() {
  const token = getCookie('token');

  fetch("http://127.0.0.1:5000/chat/send", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              chat_id: CHAT_ID,
              token: token,
              text: document.getElementById('inputText').value
          })
      }).then(response => {
          if (!response.ok) {
              throw new Error('Chat not found');
          }
          return response.json();
      })
      .then(data => {
          console.log(data)
      })
  const chatContainer = document.getElementById('chat');
  const messageElement = document.createElement('div');
  messageElement.textContent = document.getElementById('inputText').value;
  messageElement.classList.add('message-container');
  messageElement.classList.add('receiver-message');
  chatContainer.appendChild(messageElement);
  document.getElementById('inputText').value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;
}