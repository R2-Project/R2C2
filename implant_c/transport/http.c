
#ifdef TRANSPORT_HTTP

// You'll also likely need other standard headers
#include <stdio.h>
#include <stdlib.h> // For malloc, free
#include <string.h> // For strcpy, etc.
#include <windows.h>
#include <wininet.h>

#pragma comment (lib, "Wininet.lib")

BOOL MakeRequest(char* host, int* port) {
	HINTERNET hInternet = NULL;
	HINTERNET hConnect = NULL;
	HINTERNET hRequest = NULL;
	PBYTE pBytes = NULL;

	char* responseBuffer = NULL;
	DWORD totalSize = 0;

	// 1 - WinInet initalization
	hInternet = InternetOpenW(L"R2C2/1.0", INTERNET_OPEN_TYPE_DIRECT, NULL, NULL, NULL);
	if (hInternet == NULL) {
		fprintf(stderr, "[!] InternetOpenW failed with error: %d \n", GetLastError());
		return FALSE;
	}

	// 2 - Connect to the server
	hConnect = InternetConnectW(hInternet, host, port, NULL, NULL, INTERNET_SERVICE_HTTP, 0, 0);
	if (!hConnect) {
		fprintf(stderr, "[!] InternetConnectW failed with error: %d \n", GetLastError());
		return FALSE;
	}

	// 3 - Create HTTP Request
	const WCHAR* acceptTypes[] = { L"application/json", NULL };
	hRequest = HttpOpenRequestW(hConnect, L"GET", "/tasks", NULL, NULL, acceptTypes, 0, 0);
	if (!hRequest) {
		fprintf(stderr, "[!] HttpOpenRequestW failed with error: %d \n", GetLastError());
		return FALSE;
	}

	// 4 - Send the request
	if (!HttpSendRequestW(hRequest, NULL, 0, NULL, 0)) {
		fprintf(stderr, "[!] HttpSendRequest failed with error: %d \n", GetLastError());
	}
	else {
		// 5 - Read response in loop
		char buffer[4096];
		DWORD bytesRead = 0;
		while (InternetReadFile(hRequest, buffer, sizeof(buffer), &bytesRead) && bytesRead > 0) {

			char* temp = realloc(responseBuffer, totalSize + bytesRead);
			if (temp == NULL) {
				fprintf(stderr, "Failed to reallocate memory.\n");
				free(responseBuffer);
				InternetCloseHandle(hRequest);
				InternetCloseHandle(hConnect);
				InternetCloseHandle(hInternet);
				return FALSE;
			}
			responseBuffer = temp;

			memcpy(responseBuffer + totalSize, buffer, bytesRead);
			totalSize += bytesRead;
		}


	}

	// 6 - cleanup handles
	InternetCloseHandle(hRequest);
	InternetCloseHandle(hConnect);
	InternetCloseHandle(hInternet);

	// terminate final response buffer
	if (responseBuffer) {
		char* temp = realloc(responseBuffer, totalSize + 1);
		if (temp) {

			responseBuffer = temp;
			responseBuffer[totalSize] = '\0';
		}
	}


	printf("[+] Response from server: %s \n", responseBuffer);
	return TRUE;
}

#endif