#ifndef HTTP_H
#define HTTP_H

#include <windows.h>

#ifdef TRANSPORT_HTTP
BOOL MakeRequest(char* host, int* port);
#endif

#endif