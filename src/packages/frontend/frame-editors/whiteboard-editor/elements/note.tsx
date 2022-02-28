import Text from "./text";
import NoteStatic, { STYLE } from "./note-static";
import { DEFAULT_NOTE } from "../tools/defaults";
import { avatar_fontcolor } from "@cocalc/frontend/account/avatar/font-color";
import { Props } from "./render";

export default function Note(props: Props) {
  const { element, focused } = props;
  if (!focused) {
    return <NoteStatic element={element} />;
  }
  const data = {
    ...element.data,
    color: avatar_fontcolor(element.data?.color),
  };
  return (
    <div
      style={{
        ...STYLE,
        background: element.data?.color ?? DEFAULT_NOTE.color,
      }}
    >
      <Text {...props} element={{ ...element, data }} noteMode />
    </div>
  );
}