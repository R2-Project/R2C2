cmake_minimum_required(VERSION 3.10)
project(Implant C)

# Set C standard (optional but recommended)
set(CMAKE_C_STANDARD 11)

# Add source files
add_executable(Implant
    implant.c
    transport/http.c
 "transport/transport.h")

# Add preprocessor definitions
target_compile_definitions(Implant PRIVATE TRANSPORT_HTTP)