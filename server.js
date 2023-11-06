// pobranie modułu (include z c w nodejs)
var express         = require('express');

//dołączanie modułu ORM 
const Sequelize = require('sequelize')

// dołączenie modułu usuwającego problem z zabezpieczeniem CORS
const cors = require('cors');

// dołączenie modułu obsługi sesji
var session = require('express-session')

// add the requirement for websockets
const WebSocket = require('ws');


//Inicjalizacja aplikacji
var app             = express();
//process.env.PORT - pobranie portu z danych środowiska np. jeżeli aplikacja zostanie uruchomiona na zewnętrznej platformie np. heroku
var PORT            = process.env.PORT || 8080;
//uruchomienie serwera
var server          = app.listen(PORT,() => console.log(`Listening on ${ PORT }`));

const sequelize = new Sequelize('database', 'root', 'root', {
    dialect: 'sqlite',
    storage: 'orm-db.sqlite',
});

const sessionParser = session({
    saveUninitialized: false,
    secret: '$secret',
    resave: false
});

// dołączenie modułu ułatwiającego przetwarzanie danych pochodzących z ciała zaytania HTTP (np. POST)
app.use(express.json());

// dołączenie modułu CORS do serwera
app.use(cors());

// dołączenie obslugi sesji do aplikacji 
app.use(sessionParser);

// add folder with client app files
app.use(express.static(__dirname + '/client/'));



const wss = new WebSocket.Server ({ 
    noServer: true,
}) ;

// Stworzenie modelu - tabeli User
const User = sequelize.define('user', {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_name: Sequelize.STRING,
    user_password: Sequelize.STRING
})


// synchroniznacja bazy danych - np. tworzenie tabel
sequelize.sync({ force: true }).then(() => {
  console.log(`Database & tables created!`)
})

server.on('upgrade', function (request, socket, head) {
    // check if seesion exists for a given connection
    sessionParser(request, {}, () => {
        if (!request.session.user_id) {
            socket.destroy();
            return;
        }
    // enables for server to overtake the wbs connection 
        wss.handleUpgrade(request, socket, head, function (ws) {
            wss.emit('connection', ws, request);
        });
    });
});

let onlineUsers = {};
// Funkcja wywoływana kiedy przyjdzie nowe połączenie ws
// Dla każdego nowego klienta tworzony jest osobne połączenie WS
wss.on('connection', function (ws, request) {

    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ status: 2 }));
        }
    });
    onlineUsers[request.session.user_id] = ws;

    ws.on('message', function (message) {
        console.log(String(message))
        // parsowanie wiadomosci z JSONa na obiekt
        try {
            var data = JSON.parse(message);
        } catch (error) {
            return;
        }
    });

    ws.on('close', () => {
        delete onlineUsers[request.session.user_id];
    })

});

function testGet(request, response){
    response.send("testGet working");
}

// rejestrowanie użytkownika
function register(request, response) {
    console.log(request.body)
    var user_name = request.body.user_name;
    var user_password = request.body.user_password;
    if (user_name && user_password) {

        User.count({ where: { user_name: user_name } }).then(
            count => {
                if (count != 0) {
                    response.send({ register: false });
                } else {
                    console.log ( " user registering " )
                    User.create({user_name: user_name, user_password: user_password})
                        .then(() => response.send({ register: true }))
                        .catch(function (err) { response.send({ register: true })               
                      });
                      
                }
            })
    } else {
        response.send({ register: false });
    }
}

// logowanie uzytkownika
function login(request, response) {
    // TODO: logowanie
    console.log('logging in')
    
    return User.findOne({
        where: {
          user_name: request.body.user_name,
          user_password: request.body.user_password,
        }, attributes: ['user_id', 'user_name']}
      )
        .then(user => {
          if (user) {
            // User with matching credentials exists
            request.session.loggedin = true;
            request.session.user_id = user.user_id;
            response.send({ loggedin: request.session.loggedin });
          } else {
            // User not found or password is incorrect
            request.session.loggedin = false;
            response.send({ loggedin: request.session.loggedin });
          }
        })
        .catch(error => {
          console.error('Error checking login:', error);
          throw error;
        });    
}

// sprawdzenie logowania jeżeli funkcja checkSessions nie zwróci błędu
function loginTest(request, response) {
    request.session.loggedin = true;
    request.session.user_id  = request.params.user_id;;
    response.send({ loggedin: true });
}

function logout(request, response) {
    console.log ( " logout " )
    request.session.destroy();
    response.send({ loggedin: false });
}

function checkSessions(request, response, next) {
    if (request.session.loggedin) {
        next();
    } else {
        response.send({ loggedin: false });
    }
}

function getUsers(request, response) {
    //TODO: wysłanie listy użytkowników klientowi
    User.findAll({attributes: ['user_id', 'user_name']})
    .then(users => {
        const userResults = users.map(user => ({
            user_id: user.user_id,
            user_name: user.user_name,
            isOnline: onlineUsers[user.user_id] !== undefined && onlineUsers[user.user_id] !== null,
          }));
        response.send({ data: userResults });
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      response.status(500).send({ error: 'Internal Server Error' });
    });
}

app.get('/api/test-get', testGet);

app.post('/api/register/', [register]);

app.post('/api/login/', [login]);

app.get('/api/login-test/', [checkSessions, loginTest]);

app.get('/api/logout/', [checkSessions, logout]);

app.get('/api/users/', [checkSessions, getUsers]);
