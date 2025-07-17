import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const tableData = [
  {
    id: 1,
    name: "HTTP Listener",
    type: "HTTP",
    ip: "192.168.1.54",
    port: 5000,
    uri: "/api/listener",
    status: "Listening",
  },
]

export default function Listeners() {
  return (
    <div className="w-full">
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Port</TableHead>
              <TableHead>URI</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.ip}</TableCell>
                <TableCell>{item.port}</TableCell>
                <TableCell>{item.uri}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

