var CHAT_ID = null;

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
    const apiUrl = `${SERVER_URL}/chat/get_all/${token}`;

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
        const apiUrl = `${SERVER_URL}/user/get_all/${token}`;

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

    $('#userList').on('click', 'li', function() {
        const userId = $(this).data('user-id');
        const token = getCookie('token');

        $.ajax({
            type: "POST",
            url: `${SERVER_URL}/chat/create`,
            contentType: "application/json",
            data: JSON.stringify({
                friend_id: userId,
                token: token
            }),
            success: function(response) {
                console.log("Чат успешно создан:", response);
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

    $.ajax({
        type: 'GET',
        url: `${SERVER_URL}/chat/history/${token}/${chat_id}`,
        success: (data) => {
            console.log(data);
            const chatContainer = $('#chat');
            chatContainer.empty(); // Очистить содержимое чата перед загрузкой новых данных
            data.messages.forEach(message => {
                const messageElement = $('<div></div>').text(message.text);
                messageElement.addClass('message-container');
                if (message.sender_id != user_id) {
                    messageElement.addClass('sender-message');
                } else {
                    messageElement.addClass('receiver-message');
                }
                chatContainer.append(messageElement);
            });
            chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
        },
        error: (xhr, status, error) => {
            alert('Ошибка: ' + error);
        }
    });

    document.cookie = `activeChatId=${chat_id}; path=/`;
}


function sendMessage() {
    const token = getCookie('token');
    const inputText = $('#inputText').val();

    $.ajax({
        type: 'POST',
        url: `${SERVER_URL}/chat/send`,
        contentType: 'application/json',
        data: JSON.stringify({
            chat_id: CHAT_ID,
            token: token,
            text: inputText
        }),
        success: (data) => {
            console.log(data);
        },
        error: (xhr, status, error) => {
            console.error('Ошибка при отправке сообщения:', error);
        }
    });

    const chatContainer = $('#chat');
    const messageElement = $('<div></div>').text(inputText);
    messageElement.addClass('message-container');
    messageElement.addClass('receiver-message');
    chatContainer.append(messageElement);
    $('#inputText').val('');
    chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
}


let currentChatId = null;




function selectFriendById(chat_id) {
    const friendElements = document.querySelectorAll('.friend');
    friendElements.forEach(friend => {
        if (friend.dataset.chatId === chat_id) {
            selectFriend(friend, chat_id);
        }
    });
}

function selectFriend(element, chat_id) {
    const friends = document.querySelectorAll('.friend');
    friends.forEach(friend => friend.classList.remove('active'));

    element.classList.add('active');

    currentChatId = chat_id;

    loadChat(chat_id);
    console.log(`Chat with user ID ${currentChatId} selected`);
}

