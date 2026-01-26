fn main() {
    let compile_time_vars = ["SESSION_ID", "LISTENER_ADDRESS"];

    for var in compile_time_vars.iter() {
        println!("cargo:rerun-if-env-changed={}", var);
    }
}
