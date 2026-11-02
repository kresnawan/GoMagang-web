import { Button, DropDown, FileInput, RadioButton, TextInput } from './component'

function App() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10">
      <h3>Komponen</h3>

      <section className="flex flex-col gap-3">
        <h6>Text Input</h6>
        <TextInput placeholder="This is how the placeholder will look like..." />
        <TextInput disabled defaultValue="This is how disabled input will look like" />
        <TextInput defaultValue="This is how normal input will look like" />
      </section>

      <p>The quick brown fox jumps over the lazy dog</p>

      <section className="flex flex-col gap-3">
        <h6>Drop Down</h6>
        <DropDown defaultValue="">
          <option value="" disabled>Pilih opsi</option>
          <option value="a">Text here</option>
          <option value="b">Opsi lain</option>
        </DropDown>
      </section>

      <section className="flex flex-col gap-3">
        <h6>Radio Button</h6>
        <label className="flex items-center gap-2">
          <RadioButton name="demo" value="1" defaultChecked /> Pilihan 1
        </label>
        <label className="flex items-center gap-2">
          <RadioButton name="demo" value="2" /> Pilihan 2
        </label>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button className='text-base px-0 py-0'>Submit</Button>
        <Button variant="outlined">Submit</Button>
        <Button disabled>Submit</Button>
      </section>

      <section className="flex flex-col gap-3">
        <h6>File Input</h6>
        <FileInput name="cv" accept=".pdf" onChange={(e) => console.log(e.target.files)} />
      </section>
    </main>
  )
}

export default App
