import { determineRefundEligibility, isNewTOS } from '../service';
import { ReversalRequest } from '@/types';

describe('isNewTOS', () => {

  it('Unsupported timezones should be rejected', () => {
    const mockRequest: ReversalRequest = {
      name: 'Emma Smith',
      customerTZ: 'Unknown',
      signupDate: '1/2/2020',
      source: 'phone',
      investmentDate: '1/2/2021',
      investmentTime: '06:00',
      requestDate: '1/2/2021',
      requestTime: '09:00'
    };
    
    const result = isNewTOS(mockRequest);
    expect(result).toEqual([new Error('Unknown timezone: Unknown'), false]);
  });

  it('New TOS (US-based)', () => {
    const mockRequest: ReversalRequest = {
      name: 'Emma Smith',
      customerTZ: 'US (PST)',
      signupDate: '1/2/2020',
      source: 'phone',
      investmentDate: '1/2/2021',
      investmentTime: '06:00',
      requestDate: '1/2/2021',
      requestTime: '09:00'
    };

    const result = isNewTOS(mockRequest);
    expect(result).toEqual([null, true]);
  });
});

describe('determineRefundEligibility', () => {
  it('should return true for a valid phone-based request (New TOS)', () => {
    // This is a valid phone-based request
    const mockRequest: ReversalRequest = {
        "name": "Emma Smith",
        "customerTZ": "US (PST)",
        "signupDate": "1/2/2020",
        "source": "phone",
        "investmentDate": "1/2/2021",
        "investmentTime": "06:00",
        "requestDate": "1/2/2021",
        "requestTime": "09:00"
    };

    const result = determineRefundEligibility(mockRequest);
    expect(result).toBe(true);
  });
}); 
