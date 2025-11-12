use crate::commands;
use std::collections::VecDeque;

#[derive(Debug)] // Add Debug to allow printing with {:?}
struct Task {
    id: u32,
    command: String,
    description: String,
}

struct Tasks {
    tasks: VecDeque<Task>,
}

impl Tasks {
    fn queue(&mut self, task: Task) -> Result<(), String> {
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
            id: 1,
            command: "ls".into(),
            description: "runs \"ls\" task".into(),
        };

        assert!(tasks.queue(task).is_ok());
        assert_eq!(tasks.tasks.len(), 1);
        assert!(tasks.dispatch().is_ok());
    }
}
