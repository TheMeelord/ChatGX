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
            data: JSON.stringify({ friend_id: userId, token: token }),
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