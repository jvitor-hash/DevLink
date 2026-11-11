# V2 shared UI

The V2 UI is a small set of composable primitives. Prefer composing markup and behavior with children over adding a prop for every visual variation. Most primitives accept the native HTML props for their element plus an occasional state prop such as `error`, `tone`, or `value`.

## Form fields

```tsx
import { Field, Input, Label, InputGroup, InputAdornment, PasswordInput } from "@/v2/shared/ui";

<Field>
  <Label htmlFor="email" required>Email</Label>
  <Input id="email" name="email" type="email" placeholder="you@example.com" />
</Field>

<Field>
  <Label htmlFor="amount">Budget</Label>
  <InputGroup>
    <InputAdornment>R$</InputAdornment>
    <Input id="amount" name="amount" className="pl-10" inputMode="numeric" />
  </InputGroup>
</Field>

<Field>
  <Label htmlFor="password">Password</Label>
  <PasswordInput id="password" name="password" />
</Field>
```

Native options are composed inside a select rather than passed as a record:

```tsx
import { Field, Label, Select, SelectOption } from "@/v2/shared/ui";

<Field>
  <Label htmlFor="platform">Platform</Label>
  <Select id="platform" name="platform" defaultValue="web">
    <SelectOption value="web">Web</SelectOption>
    <SelectOption value="mobile">Mobile</SelectOption>
  </Select>
</Field>
```

## Interactive compositions

```tsx
import { Segment, Segmented, Steps } from "@/v2/shared/ui";

<Segmented value={status} onChange={setStatus}>
  <Segment value="open">Open</Segment>
  <Segment value="closed">Closed</Segment>
</Segmented>

<Steps current={2}>
  <Steps.Item step={1}><Steps.Indicator /></Steps.Item>
  <Steps.Item step={2}><Steps.Indicator /></Steps.Item>
  <Steps.Item step={3}><Steps.Indicator /></Steps.Item>
</Steps>
```

Other primitives follow the same pattern:

```tsx
<Card><Badge tone="success">Published</Badge><p>Project content</p></Card>
<Button onClick={save}>Save</Button>
<Drawer open={menuOpen} onClose={() => setMenuOpen(false)}><nav>...</nav></Drawer>
```

Use the native event handlers (`onChange`, `onClick`, `onFocus`, and so on) whenever possible. This keeps the components compatible with standard React forms and avoids V1-style callback aliases.
