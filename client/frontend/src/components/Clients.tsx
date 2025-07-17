import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const tableData = [
  {
    id: 1,
    external: "192.168.1.54",
    internal: "192.168.1.54",
    listener: "HTTP",
    user: "jonh.doe",
    computer: "DESKTOP-ABC123",
    process: "notepad.exe",
    pid: 3033,
    arch: "x64",
    last_ping: "1m",
  },
]

export default function Component() {
  return (
    <div className="w-full">
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>External</TableHead>
              <TableHead>Internal</TableHead>
              <TableHead>Listener</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Computer</TableHead>
              <TableHead>Process</TableHead>
              <TableHead>PID</TableHead>
              <TableHead>Arch</TableHead>
              <TableHead>Last ping</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.external}</TableCell>
                <TableCell>{item.internal}</TableCell>
                <TableCell>{item.listener}</TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell>{item.computer}</TableCell>
                <TableCell>{item.process}</TableCell>
                <TableCell>{item.pid}</TableCell>
                <TableCell>{item.arch}</TableCell>
                <TableCell>{item.last_ping}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
