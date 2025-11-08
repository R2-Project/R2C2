package listeners

import "sync"

func NewListenersService() *Listeners {
	return &Listeners{
		httpListeners: map[string]*HttpListener{},
		mutex:         &sync.RWMutex{},
	}
}

type Listeners struct {
	httpListeners map[string]*HttpListener
	mutex         *sync.RWMutex
}

func (l *Listeners) AddHttpListener(listener *HttpListener) {
	l.mutex.Lock()
	defer l.mutex.Unlock()
	l.httpListeners[listener.Id] = listener
}

func (l *Listeners) GetHttpListener(listenerId string) *HttpListener {
	l.mutex.RLock()
	defer l.mutex.RUnlock()
	return l.httpListeners[listenerId]
}

func (l *Listeners) RemoveHttpListener(listenerId string) {
	l.mutex.Lock()
	defer l.mutex.Unlock()
	delete(l.httpListeners, listenerId)
}

func (l *Listeners) GetHttpListeners() []HttpListener {
	var result []HttpListener
	for _, listener := range l.httpListeners {
		result = append(result, *listener)
	}
	return result
}
