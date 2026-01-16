use crate::commands;
use serde::Deserialize;
use std::collections::VecDeque;

#[derive(Debug, Deserialize)] // Add Debug to allow printing with {:?}
pub struct Task {
    pub id: String,
    pub agent_id: String,
    pub command: String,
    pub args: Vec<String>,
    pub status: String,
    pub timestamp: String,
}

pub struct Tasks {
    tasks: VecDeque<Task>,
}

impl Tasks {
    pub fn queue(&mut self, task: Task) -> Result<(), String> {
        println!("Queueing task: {:?}", task); // Debug print
        self.tasks.push_back(task);

        Ok(())
    }

    fn dispatch(&mut self) -> Result<(), String> {
        if self.tasks.is_empty() {
            return Err("No tasks available".into());
        }

        let task = self.tasks.pop_front().ok_or("No tasks available")?;

        let _ = match task.command.as_str() {
            "ls" => commands::ls_command(),
            _ => return Err(format!("Unknown command: {}", task.command)),
        };
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_queue_task() {
        let mut tasks = Tasks {
            tasks: VecDeque::new(),
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
        assert!(tasks.dispatch().is_ok());
    }
}
