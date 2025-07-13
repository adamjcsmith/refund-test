import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import data from "../data/reversals.json"
import { ReversalRequest } from "@/types"
import { determineRefundEligibility } from "@/lib/service";

interface RefundRequest extends ReversalRequest {
  refundEligible: boolean;
}

const RefundTable = () => {
  const refundEligibilityErrors: Error[] = [];
  const refundEligibilityResults: RefundRequest[] = [];

  data.forEach((row: ReversalRequest) => {
    const [error, refundEligible] = determineRefundEligibility(row);
    if (error) {
      refundEligibilityErrors.push(error);
    }

    refundEligibilityResults.push({ ...row, refundEligible: refundEligible ?? false });
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead>Customer Location</TableHead>
          <TableHead>Sign up date</TableHead>
          <TableHead>Request Source</TableHead>
          <TableHead>Investment Date</TableHead>
          <TableHead>Investment Time</TableHead>
          <TableHead>Refund Request Date</TableHead>
          <TableHead>Refund Request Time</TableHead>
          <TableHead>Refund Eligible</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {refundEligibilityResults.map((row: RefundRequest) => (
          <TableRow key={row.name}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.customerTZ}</TableCell>
            <TableCell>{row.signupDate}</TableCell>
            <TableCell>{row.source}</TableCell>
            <TableCell>{row.investmentDate}</TableCell>
            <TableCell>{row.investmentTime}</TableCell>
            <TableCell>{row.requestDate}</TableCell>
            <TableCell>{row.requestTime}</TableCell>
            <TableCell className={row.refundEligible ? 'text-green-500' : 'text-red-500'}>{row.refundEligible ? 'Yes' : 'No'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default RefundTable
