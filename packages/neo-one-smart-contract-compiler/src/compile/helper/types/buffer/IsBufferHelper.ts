import { IsHelper } from '../IsHelper';
import { Types } from '../Types';

// Input: [val]
// Output: [boolean]
export class IsBufferHelper extends IsHelper {
  protected readonly type = Types.Buffer;
}
