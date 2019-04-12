// handle socket io subscrition, unsubscribe, connection, etc
import io from 'socket.io-client';

// connect to last for prices
// subscribe to symbols
// if there is a callback when connected
// and returns socket
export function connectIEXLast({ callback, symbols }){
  let socket= io('https://ws-api.iextrading.com/1.0/last');
  socket.on('connect', () => {
    socket.emit('subscribe', symbols.join(','));
    if(callback) callback();
  })
  return socket;
}

// add subscrition to symbol on a given socket
// symbols = []
// return true if subscribe
export function addSubscriptionLast(socket, symbols){
  if(socket.connected){
    socket.emit('subscribe', symbols.join(','));
    return true;
  }
  return false;
}

//
export function removeSubscriptionLast(socket, symbols){
  if(socket.connected){
    socket.emit('unsubscribe', symbols.join(','));
    return true;
  }
  return false;
}

export function socketRemoveListeners(socket, listeners){
  if(socket.connected){
    for(let i in listeners){
      socket.removeListener(listeners[i],
        () => console.log(`remove ${listeners[i]}`));
    }
  }
  return false;
}
