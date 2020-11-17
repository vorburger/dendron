import { NoteUtilsV2 } from "@dendronhq/common-all";
import vscode, { Location, Position, Uri } from "vscode";
import { getReferenceAtPosition } from "../utils/md";
import { DendronWorkspace } from "../workspace";

export default class DefinitionProvider implements vscode.DefinitionProvider {
  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): Promise<vscode.Location | vscode.Location[] | undefined> {
    const refAtPos = getReferenceAtPosition(document, position);
    if (!refAtPos) {
      return;
    }
    const engine = DendronWorkspace.instance().getEngine();
    const notes = NoteUtilsV2.getNotesByFname({
      fname: refAtPos.ref,
      engine,
    });
    const uris = notes.map((note) => Uri.file(NoteUtilsV2.getPath({ note })));
    const out = uris.map((uri) => new Location(uri, new Position(0, 0)));
    if (out.length > 1) {
      return out;
    } else if (out.length === 1) {
      return out[0];
    } else {
      return;
    }
  }
}
